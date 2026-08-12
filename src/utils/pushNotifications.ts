import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../api/supabaseClient';

export async function initPushNotifications() {
  try {
    // Проверяем разрешение на push-уведомления
    let permission = await PushNotifications.checkPermissions();

    if (permission.receive === 'prompt') {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== 'granted') {
      console.warn('🔕 Push-уведомления запрещены');
      return;
    }

    // Обработчик успешной регистрации FCM
    await PushNotifications.addListener('registration', async (token) => {
      console.log('🔥 FCM TOKEN:', token.value);

      try {
        // Получаем текущего авторизованного пользователя
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          console.warn(
            '⚠️ FCM-токен получен, но пользователь не авторизован'
          );
          return;
        }

        // Сохраняем FCM-токен в Supabase
        const { error: tokenError } = await supabase
          .from('push_tokens')
          .upsert(
            {
              user_id: user.id,
              token: token.value,
              platform: 'android',
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'token',
            }
          );

        if (tokenError) {
          throw tokenError;
        }

        console.log('✅ FCM-токен сохранён в Supabase');
      } catch (error) {
        console.error(
          '❌ Не удалось сохранить FCM-токен:',
          error
        );
      }
    });

    // Ошибка регистрации FCM
    await PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.error('❌ FCM registration error:', error);
      }
    );

    // Push получен, пока приложение открыто
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('🔔 Push получен:', notification);
      }
    );

    // Пользователь нажал на уведомление
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        console.log('👆 Нажатие на push:', action);
      }
    );

    // Запускаем регистрацию устройства в FCM
    await PushNotifications.register();

    console.log('✅ Регистрация FCM запущена');
  } catch (error) {
    console.error(
      '❌ Ошибка инициализации push-уведомлений:',
      error
    );
  }
}