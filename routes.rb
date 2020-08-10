Rails.application.routes.draw do
  resources :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  get "/login", to: "users#login"

  resource :session, only: [:new, :create, :destroy]
end
