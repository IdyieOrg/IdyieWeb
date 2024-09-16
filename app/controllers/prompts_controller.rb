class PromptsController < ApplicationController
  def send_to_api
    @prompts = IdyieApiService.get('/prompts', body: { prompt: params[:query] })

    if @prompts
      render json: @prompts, status: :ok
    else
      render json: { error: 'Unable to fetch prompts' }, status: :bad_request
    end
  end
end
