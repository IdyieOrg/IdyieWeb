module ChatsResponseConcern
  extend ActiveSupport::Concern

  private

  def respond_success(message)
    respond_to do |format|
      format.html { redirect_to chats_path, notice: message }
      format.json { render json: { success: true, message: message }, status: :ok }
      format.any  { render json: { success: true, message: message }, status: :ok }
    end
  end

  def respond_error(message)
    respond_to do |format|
      format.html { redirect_to chats_path, alert: message }
      format.json { render json: { error: message }, status: :unprocessable_entity }
      format.any  { render json: { error: message }, status: :unprocessable_entity }
    end
  end
end
