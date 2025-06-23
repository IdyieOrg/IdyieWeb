class HomeController < ApplicationController
  include HTTParty

  before_action :authenticate_user!, only: [:index]

  def index
    @title = 'Home'
  end
end
