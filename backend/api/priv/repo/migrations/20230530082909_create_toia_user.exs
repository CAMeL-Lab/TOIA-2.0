defmodule Toia.Repo.Migrations.CreateToiaUser do
  use Ecto.Migration

  def change do
    create table(:toia_user, primary_key: false) do
      add :id, :serial, primary_key: true
      add :first_name, :string, null: false
      add :last_name, :string, null: false
      add :language, :string, null: false
      add :email, :string, null: false
      add :password, :string, null: false
    end

    create unique_index(:toia_user, [:id])
    create unique_index(:toia_user, [:email])
  end
end
