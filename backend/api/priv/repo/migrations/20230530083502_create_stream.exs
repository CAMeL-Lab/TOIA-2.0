defmodule Toia.Repo.Migrations.CreateStream do
  use Ecto.Migration

  def change do
    create table(:stream, primary_key: false) do
      add :id_stream, :serial, primary_key: true
      add :name, :string, null: false
      add :private, :boolean, default: false, null: false
      add :likes, :integer, default: 0, null: false
      add :views, :integer, default: 0, null: false
      add :toia_id, references(:toia_user, on_delete: :delete_all, type: :serial), null: false
    end

    create index(:stream, [:toia_id])
  end
end