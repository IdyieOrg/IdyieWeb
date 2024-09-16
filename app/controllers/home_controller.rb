class HomeController < ApplicationController
  include HTTParty

  def index
    @title = 'Home'
  end
end
