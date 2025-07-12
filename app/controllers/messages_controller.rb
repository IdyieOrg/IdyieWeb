class MessagesController < ApplicationController
  before_action :authenticate_user!

  def create
    @chat = current_user.chats.find(params[:chat_id])
    @message = @chat.messages.create(message_params)

    if @message.persisted?
      update_chat_has_messages_if_first
      render json: @message, status: :created
    else
      render json: { error: 'Erreur lors de la création du message', details: @message.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.expect(message: [:role, :content])
  end

  def update_chat_has_messages_if_first
    return unless @chat.messages.one? && Chat.column_names.include?('has_messages')

    Rails.logger.debug { "MESSAGE: Premier message du chat #{@chat.id}, mise à jour has_messages" }

    @chat.update(has_messages: true)
  end
end
