class PromptsController < ApplicationController
  def send_to_api
    jwt = session[:jwt_token]
    service = IdyieApiService.new(jwt)
    response = service.get('/prompts', body: { prompt: params[:query] })

    if response.success?
      render json: JSON.parse(response.body), status: :ok
    else
      render json: { error: 'Unable to fetch prompts' }, status: :bad_request
    end
  end
end
