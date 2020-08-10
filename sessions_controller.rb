class SessionsController < ApplicationController
   
    def new
    
    end
    
    def create
        user = User.find_by(email: params[:email])
        if user && user.authenticate(params[:password])
            session[:user_id] = user.id
            flash[:notice] = "Welcome back, #{user.name}"
            redirect_to "/users"
        else
            flash[:notice] = "Invalid Email/Password combination"
            render :new 
        end
      
    end
    
    def destroy
    
    end
end
