class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    if Chat.column_names.include?('has_messages')
      @chats = current_user.chats.where(has_messages: true).order(updated_at: :desc)
    else
      @chats = current_user.chats.joins(:messages).distinct.order(updated_at: :desc)
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
    Rails.logger.debug "PARAMS RECUS: \n#{params.inspect}"
    @chat = current_user.chats.create(chat_params)
    if @chat.persisted?
      Rails.logger.debug "CHAT CREE: \n#{@chat.inspect}"
      render json: @chat, status: :created
    else
      Rails.logger.debug "ERREUR CREATION CHAT: \n#{@chat.errors.full_messages}"
      render json: { error: "Erreur lors de la création", details: @chat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def create_empty
    Rails.logger.debug "CREATE_EMPTY: Création d'un chat vide"
    begin
      if Chat.column_names.include?('has_messages')
        @chat = current_user.chats.create(title: 'Nouveau chat', has_messages: false)
      else
        Rails.logger.warn "CREATE_EMPTY: Champ has_messages n'existe pas, création sans ce champ"
        @chat = current_user.chats.create(title: 'Nouveau chat')
      end
      Rails.logger.debug "CREATE_EMPTY: Chat créé: #{@chat.inspect}"
      if @chat.persisted?
        render json: @chat, status: :created
      else
        Rails.logger.error "CREATE_EMPTY: Erreur création chat: #{@chat.errors.full_messages}"
        render json: { error: "Erreur lors de la création du chat vide", details: @chat.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "CREATE_EMPTY: Exception: #{e.message}"
      Rails.logger.error "CREATE_EMPTY: Backtrace: #{e.backtrace.join("\n")}"
      render json: { error: "Erreur lors de la création du chat vide", details: e.message }, status: :internal_server_error
    end
  end

  def update
    @chat = Chat.find(params[:id])
    if @chat.update(chat_params)
      render json: @chat
    else
      render json: { errors: @chat.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @chat = current_user.chats.find(params[:id])
    if @chat.destroy
      respond_to do |format|
        format.html { redirect_to chats_path, notice: 'Chat supprimé avec succès' }
        format.json { render json: { success: true, message: 'Chat supprimé avec succès' }, status: :ok }
        format.any { render json: { success: true, message: 'Chat supprimé avec succès' }, status: :ok }
      end
    else
      respond_to do |format|
        format.html { redirect_to chats_path, alert: 'Erreur lors de la suppression du chat' }
        format.json { render json: { error: 'Erreur lors de la suppression du chat' }, status: :unprocessable_entity }
        format.any { render json: { error: 'Erreur lors de la suppression du chat' }, status: :unprocessable_entity }
      end
    end
  end

  private

  def chat_params
    params.require(:chat).permit(:title)
  end
end
