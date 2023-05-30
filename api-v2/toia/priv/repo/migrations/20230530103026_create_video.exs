defmodule Toia.Repo.Migrations.CreateVideo do
  use Ecto.Migration

  def change do
    create table(:video, primary_key: false) do
      add :id_video, :string, null: false, primary_key: true
      add :idx, :integer, null: false
      add :private, :boolean, default: false, null: false
      add :answer, :text, null: false
      add :language, :string, null: false
      add :likes, :integer, default: 0, null: false
      add :views, :integer, default: 0, null: false
      add :duration_seconds, :integer, null: false
      add :toia_id, references(:toia_user, on_delete: :delete_all, type: :integer), null: false
    end

    create index(:video, [:toia_id])
    create unique_index(:video, [:id_video])
  end
end
