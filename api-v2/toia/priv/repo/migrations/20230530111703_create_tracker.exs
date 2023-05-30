defmodule Toia.Repo.Migrations.CreateTracker do
  use Ecto.Migration

  def change do
    create table(:tracker, primary_key: false) do
      add :track_id, :integer, null: false, primary_key: true
      add :activity, :string, null: false
      add :start_time, :integer, null: false
      add :end_time, :integer
      add :video_id, :string
      add :old_video_id, :string
      add :user_id, references(:toia_user, on_delete: :delete_all, type: :integer), null: false
    end

    create index(:tracker, [:user_id])
  end
end
