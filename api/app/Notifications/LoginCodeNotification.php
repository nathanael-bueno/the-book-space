<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoginCodeNotification extends Notification
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
            ->subject('Codigo de acesso - The Book Space')
            ->greeting('Ola, ' . $notifiable->nome_completo . '!')
            ->line('Use o codigo abaixo para entrar na sua conta:')
            ->line('**' . $this->code . '**')
            ->line('Este codigo expira em 10 minutos.')
            ->line('Se voce nao tentou entrar, ignore este e-mail.');
    }
}
