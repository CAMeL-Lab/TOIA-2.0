defmodule Toia.Repo.Migrations.CreateStream do
  use Ecto.Migration

  def change do
    create table(:stream) do
      add :name, :string
      add :private, :boolean, default: false, null: false
      add :likes, :integer
      add :views, :integer
      add :toia_id, references(:toia_users, on_delete: :nothing)

      timestamps()
    end

    create index(:stream, [:toia_id])
  end
end
