class ApplicationController < ActionController::Base
  before_action :store_jwt_in_session, if: :user_signed_in?

  private

  def store_jwt_in_session
    return if session[:jwt_token].present? # évite de le faire à chaque requête

    response = exchange_token_request

    if response.code == 200
      session[:jwt_token] = parse_jwt_token(response.body)
    else
      log_jwt_error(response.code)
    end
  end

  def exchange_token_request
    api_url = "#{ENV.fetch('IDYIE_API_URL') || 'http://idyie-api-application:8080'}/api/v1"
    url = "#{api_url}/auth/token/exchange"
    payload = jwt_payload
    signature = generate_signature(payload)
    headers = {
      'Content-Type' => 'application/json',
      'X-Signature' => signature
    }
    HTTParty.post(url, body: payload.to_json, headers:)
  end

  def generate_signature(payload)
    shared_secret = Rails.application.credentials.api_shared_secret
    OpenSSL::HMAC.hexdigest('SHA256', shared_secret, payload.to_json)
  end

  def jwt_payload
    {
      user_id: current_user.id,
      email: current_user.email,
      timestamp: Time.now.to_i
    }
  end

  def parse_jwt_token(body)
    JSON.parse(body)['token']
  end

  def log_jwt_error(code)
    Rails.logger.error("Impossible de récupérer le JWT depuis IdyieAPI : #{code}")
  end
end
