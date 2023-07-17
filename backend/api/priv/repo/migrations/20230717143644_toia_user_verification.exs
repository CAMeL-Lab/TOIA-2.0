defmodule Toia.Repo.Migrations.ToiaUserVerification do
  use Ecto.Migration

  def change do
    alter table(:toia_user) do
      add :verified, :boolean, default: false
    end
  end
end
