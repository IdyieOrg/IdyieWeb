require 'rails_helper'

RSpec.describe 'Home', type: :request do
  describe 'GET /index' do
    it 'assigns the correct title to @title' do
      get root_path
      expect(assigns(:title)).to eq('Home')
    end

    it 'renders the index template' do
      get root_path
      expect(response).to render_template(:index)
    end

    it 'responds successfully with an HTTP 200 status code' do
      get root_path
      expect(response).to have_http_status(:ok)
    end
  end
end
