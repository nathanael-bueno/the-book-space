<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationCodeNotification extends Notification
{
    use Queueable;

    public function __construct(public string $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Código de verificação de e-mail')
            ->greeting('Olá, ' . $notifiable->nome_completo . '!')
            ->line('Use o código abaixo para verificar seu e-mail:')
            ->line('**' . $this->code . '**')
            ->line('Este código expira em 15 minutos.')
            ->line('Se você não criou uma conta, ignore este e-mail.');
    }
}
