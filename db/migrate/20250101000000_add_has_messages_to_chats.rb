class AddHasMessagesToChats < ActiveRecord::Migration[7.1]
  def change
    add_column :chats, :has_messages, :boolean, default: false, null: false
  end
end 