class IdyieApiService
  include HTTParty
  base_uri "#{ENV.fetch('IDYIE_API_URL') { 'http://idyie-api-application:8080' }}/api/v1"

  def initialize(jwt)
    @jwt = jwt
    @headers = {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{@jwt}"
    }
  end

  def get(endpoint, body: nil)
    self.class.get(endpoint, headers: @headers, body: body.to_json, timeout: 1800)
  rescue HTTParty::Error => e
    Rails.logger.error("HTTParty error: #{e.message}")
    raise "Failed to fetch data from Idyie API: #{e.message}"
  rescue StandardError => e
    Rails.logger.error("Standard error: #{e.message}")
    raise "An error occurred while communicating with Idyie API: #{e.message}"
  end

  def post(endpoint, body:)
    self.class.post(endpoint, headers: @headers, body: body.to_json, timeout: 1800)
  rescue HTTParty::Error => e
    Rails.logger.error("HTTParty error: #{e.message}")
    raise "Failed to post data to Idyie API: #{e.message}"
  rescue StandardError => e
    Rails.logger.error("Standard error: #{e.message}")
    raise "An error occurred while communicating with Idyie API: #{e.message}"
  end
end
