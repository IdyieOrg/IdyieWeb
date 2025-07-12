class MessagesController < ApplicationController
  before_action :authenticate_user!

  def create
    @chat = current_user.chats.find(params[:chat_id])
    @message = @chat.messages.create(message_params)
    
    if @message.persisted?
      if @chat.messages.count == 1 && Chat.column_names.include?('has_messages')
        Rails.logger.debug "MESSAGE: Premier message du chat #{@chat.id}, mise à jour has_messages"
        @chat.update_column(:has_messages, true)
      end
      
      render json: @message, status: :created
    else
      render json: { error: 'Erreur lors de la création du message', details: @message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:message).permit(:role, :content)
  end
end
