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
    options = { headers: @headers }
    options[:body] = body.to_json if body
    self.class.get(endpoint, options)
  end

  def post(endpoint, body:)
    self.class.post(endpoint, headers: @headers, body: body.to_json)
  end
end
