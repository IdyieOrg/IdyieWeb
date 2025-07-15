module ChatsCreationConcern
  extend ActiveSupport::Concern

  included do
    rescue_from StandardError, with: :handle_creation_exception
  end

  def create_empty
    Rails.logger.debug "CREATE_EMPTY: Création d'un chat vide"

    @chat = build_empty_chat

    if @chat.save
      Rails.logger.debug { "CREATE_EMPTY: Chat créé: #{@chat.inspect}" }
      render json: @chat, status: :created
    else
      log_creation_error
      render_creation_error(@chat.errors.full_messages)
    end
  end

  private

  def build_empty_chat
    if Chat.column_names.include?('has_messages')
      current_user.chats.new(title: 'Nouveau chat', has_messages: false)
    else
      Rails.logger.warn "CREATE_EMPTY: Champ has_messages n'existe pas, création sans ce champ"
      current_user.chats.new(title: 'Nouveau chat')
    end
  end

  def log_creation_error
    Rails.logger.error "CREATE_EMPTY: Erreur création chat: #{@chat.errors.full_messages}"
  end

  def render_creation_error(details)
    render json: {
      error: I18n.t('errors.chat_creation_failed'),
      details: details
    }, status: :unprocessable_entity
  end

  def handle_creation_exception(exception)
    Rails.logger.error "CREATE_EMPTY: Exception: #{exception.message}"
    Rails.logger.error "CREATE_EMPTY: Backtrace: #{exception.backtrace.join("\n")}"

    render json: {
      error: I18n.t('errors.chat_creation_failed'),
      details: exception.message
    }, status: :internal_server_error
  end
end
