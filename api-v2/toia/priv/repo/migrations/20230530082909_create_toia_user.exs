defmodule Toia.Repo.Migrations.CreateToiaUser do
  use Ecto.Migration

  def change do
    create table(:toia_user, primary_key: false) do
      add :id, :integer, primary_key: true
      add :first_name, :string, null: false
      add :last_name, :string, null: false
      add :language, :string, null: false
      add :email, :string, null: false
      add :password, :string, null: false
    end
  end
end
