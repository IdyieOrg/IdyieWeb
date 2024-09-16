class IdyieApiService
  include HTTParty
  base_uri "#{ENV.fetch('IDYIE_API_URL') || 'http://idyie-api-application:8080'}/api/v1"

  def initialize
    @headers = { 'Content-Type' => 'application/json' }
  end

  def get(endpoint)
    self.class.get(endpoint, headers: @headers)
  end

  def post(endpoint, body)
    self.class.post(endpoint, headers: @headers, body: body.to_json)
  end
end
