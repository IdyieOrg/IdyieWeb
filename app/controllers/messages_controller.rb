class MessagesController < ApplicationController
  before_action :authenticate_user!

  def create
    @chat = current_user.chats.find(params[:chat_id])
    @message = @chat.messages.create(message_params)

    if @message.persisted?
      handle_first_message
      touch_chat
      render_message_json
    else
      render_error_json
    end
  end

  private

  def message_params
    params.expect(message: [:role, :content])
  end

  def handle_first_message
    update_chat_has_messages_if_first
  end

  def touch_chat
    @chat.touch # rubocop:disable Rails/SkipsModelValidations
  end

  def render_message_json
    render json: {
      id: @message.id,
      chat_id: @chat.id,
      chat_title: @chat.title,
      chat_created_at: @chat.created_at,
      role: @message.role,
      content: @message.content,
      created_at: @message.created_at
    }, status: :created
  end

  def render_error_json
    render json: { error: 'Erreur lors de la création du message', details: @message.errors.full_messages },
           status: :unprocessable_entity
  end

  def update_chat_has_messages_if_first
    return unless @chat.messages.one? && Chat.column_names.include?('has_messages')

    Rails.logger.debug { "MESSAGE: Premier message du chat #{@chat.id}, mise à jour has_messages" }

    @chat.update(has_messages: true)
  end
end
