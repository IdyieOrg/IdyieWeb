class ChatsController < ApplicationController
  include ChatsCreationConcern
  include ChatsResponseConcern

  before_action :authenticate_user!

  def index
    @chats = if Chat.column_names.include?('has_messages')
               current_user.chats.where(has_messages: true).order(updated_at: :desc)
             else
               current_user.chats.joins(:messages).distinct.order(updated_at: :desc)
             end
    respond_to do |format|
      format.html
      format.json { render json: @chats }
    end
  end

  def show
    @chat = current_user.chats.find(params[:id])
    @messages = @chat.messages.order(:created_at)
    respond_to do |format|
      format.html
      format.json { render json: { chat: @chat, messages: @messages } }
    end
  end

  def create
    Rails.logger.debug { "PARAMS RECUS: \n#{params.inspect}" }

    @chat = build_chat

    if @chat.persisted?
      Rails.logger.debug { "CHAT CREE: \n#{@chat.inspect}" }
      render json: @chat, status: :created
    else
      log_creation_errors
      render_creation_errors(@chat.errors.full_messages)
    end
  end

  def update
    @chat = current_user.chats.find(params[:id])
    if @chat.update(chat_params)
      @chat.touch if chat_params[:title].present?
      render json: @chat
    else
      render json: { errors: @chat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @chat = current_user.chats.find(params[:id])
    if @chat.destroy
      respond_success(I18n.t('notices.chat_deleted'))
    else
      respond_error(I18n.t('errors.chat_deletion_failed'))
    end
  end

  private

  def build_chat
    current_user.chats.create(chat_params)
  end

  def log_creation_errors
    Rails.logger.debug { "ERREUR CREATION CHAT: \n#{@chat.errors.full_messages}" }
  end

  def render_creation_errors(details)
    render json: {
      error: I18n.t('errors.chat_creation_failed'),
      details: details
    }, status: :unprocessable_entity
  end

  def chat_params
    params.expect(chat: [:title])
  end
end
