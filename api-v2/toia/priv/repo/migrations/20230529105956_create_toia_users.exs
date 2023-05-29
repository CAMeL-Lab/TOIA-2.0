defmodule Toia.Repo.Migrations.CreateToiaUsers do
  use Ecto.Migration

  def change do
    create table(:toia_users) do
      add :first_name, :string
      add :last_name, :string
      add :language, :string
      add :email, :string
      add :password, :string

      timestamps()
    end
  end
end
