<?php

namespace App\Notifications;

use App\Models\Trade;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TradeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Trade $trade,
        public string $type,
        public string $title,
        public ?string $description = null
    ) {
        $this->trade->load(['requestedBook', 'offeredBook', 'proponent', 'recipient']);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $prefs = $notifiable->getEffectiveNotificationPreferences();

        // Verifica se o usuário habilitou o recebimento de e-mails
        if (isset($prefs['recebe_email']) && $prefs['recebe_email']) {
            return ['mail'];
        }

        return [];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'http://localhost:5173');
        $url = rtrim($frontendUrl, '/') . '/app/trades/' . $this->trade->id;

        $message = (new MailMessage)
            ->greeting('Olá, ' . $notifiable->nome_completo . '!');

        switch ($this->type) {
            case 'trade_proposal':
                $message->subject('Nova proposta de troca - The Book Space')
                    ->line('Você recebeu uma nova proposta de troca!')
                    ->line("Livro solicitado: **{$this->trade->requestedBook->titulo}**")
                    ->line("Livro oferecido: **{$this->trade->offeredBook->titulo}**")
                    ->action('Ver Proposta', $url);
                break;

            case 'trade_accepted':
                $message->subject('Sua proposta foi aceita! - The Book Space')
                    ->line('Boas notícias! Sua proposta de troca foi aceita.')
                    ->line("Livro: **{$this->trade->requestedBook->titulo}**")
                    ->action('Combinar Entrega', $url);
                break;

            case 'trade_rejected':
                $message->subject('Sua proposta foi recusada - The Book Space')
                    ->line('Sua proposta de troca foi recusada pelo destinatário.')
                    ->line("Livro: **{$this->trade->requestedBook->titulo}**")
                    ->action('Ver Detalhes', $url);
                break;

            case 'trade_completed':
                $message->subject('Troca concluída com sucesso! - The Book Space')
                    ->line('A troca foi finalizada por ambas as partes. Esperamos que aproveite sua nova leitura!')
                    ->action('Avaliar Troca', $url);
                break;

            case 'trade_canceled':
                $message->subject('Proposta de troca cancelada - The Book Space')
                    ->line('A proposta de troca pendente foi cancelada pelo proponente.')
                    ->line("Livro: **{$this->trade->requestedBook->titulo}**")
                    ->action('Ver Detalhes', $url);
                break;

            default:
                $message->subject($this->title . ' - The Book Space')
                    ->line($this->description ?? $this->title)
                    ->action('Ver Troca', $url);
        }

        return $message->line('Obrigado por fazer parte da nossa comunidade literária!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'trade_id' => $this->trade->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'action_to' => '/app/trades/' . $this->trade->id,
        ];
    }
}
