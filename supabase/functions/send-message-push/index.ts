import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const firebaseServiceAccountRaw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')!;

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);

interface RequestBody {
  chatId: number;
  senderId: string;
  message: string;
}

interface FirebaseServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

async function createFirebaseAccessToken(
  serviceAccount: FirebaseServiceAccount,
): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const base64UrlEncode = (value: string) =>
    btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const pemContents = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(
    atob(pemContents),
    (char) => char.charCodeAt(0),
  );

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );

  const signatureBase64 = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature)),
  );

  const jwt = `${signingInput}.${signatureBase64}`;

  const tokenResponse = await fetch(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type:
          'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    },
  );

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Firebase OAuth error: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();

  return tokenData.access_token;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const body: RequestBody = await req.json();

    if (
      !body.chatId ||
      !body.senderId ||
      !body.message
    ) {
      return new Response(
        JSON.stringify({
          error: 'chatId, senderId and message are required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    console.log(
      `📨 Новое сообщение: chat=${body.chatId}, sender=${body.senderId}`,
    );

    // Получаем участников чата
    const { data: participants, error: participantsError } =
      await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', body.chatId);

    if (participantsError) {
      throw participantsError;
    }

    if (!participants || participants.length === 0) {
      console.log('⚠️ Участники чата не найдены');

      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Для личного чата получатель — второй участник
    const recipientIds = participants
      .map((participant) => participant.user_id)
      .filter((userId) => userId !== body.senderId);

    if (recipientIds.length === 0) {
      console.log('⚠️ Получатель сообщения не найден');

      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    console.log(
      `👤 Получатель(и): ${recipientIds.join(', ')}`,
    );

    // Получаем имя отправителя
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', body.senderId)
      .single();

    const senderName =
      senderProfile?.username || 'Новое сообщение';

    // Получаем FCM-токены получателя
    const { data: tokens, error: tokensError } =
      await supabase
        .from('push_tokens')
        .select('id, token, platform')
        .in('user_id', recipientIds);

    if (tokensError) {
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('⚠️ FCM-токены получателя не найдены');

      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const serviceAccount: FirebaseServiceAccount =
      JSON.parse(firebaseServiceAccountRaw);

    const accessToken =
      await createFirebaseAccessToken(serviceAccount);

    let sent = 0;

    for (const tokenRow of tokens) {
      if (tokenRow.platform !== 'android') {
        continue;
      }

      console.log(
        `📱 Отправляем FCM для token id=${tokenRow.id}`,
      );

      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: tokenRow.token,

              notification: {
                title: senderName,
                body: body.message,
              },

              data: {
                type: 'chat_message',
                chatId: String(body.chatId),
              },

              android: {
                priority: 'high',

                notification: {
                  channel_id: 'default',
                  sound: 'default',
                },
              },
            },
          }),
        },
      );

      if (response.ok) {
        sent++;

        console.log(
          `✅ FCM успешно отправлен для token id=${tokenRow.id}`,
        );
      } else {
        const errorText = await response.text();

        console.error(
          `❌ FCM error для token id=${tokenRow.id}:`,
          errorText,
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error(
      '❌ send-message-push error:',
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
});