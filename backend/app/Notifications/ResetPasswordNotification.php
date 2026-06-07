<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url');
        $email       = urlencode($notifiable->getEmailForPasswordReset());
        $url         = "{$frontendUrl}/reset-password?token={$this->token}&email={$email}";

        return (new MailMessage)
            ->subject('Redefinição de senha')
            ->greeting('Olá, ' . $notifiable->nome_completo . '!')
            ->line('Recebemos uma solicitação para redefinir a senha da sua conta.')
            ->action('Redefinir senha', $url)
            ->line('Este link expira em **1 hora**.')
            ->line('Se você não solicitou a redefinição, ignore este e-mail.');
    }
}
