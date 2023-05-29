defmodule Toia.Repo.Migrations.CreateStreamViewPermission do
  use Ecto.Migration

  def change do
    create table(:stream_view_permission) do
      add :toia_id, references(:toia_users, on_delete: :nothing)
      add :stream_id, references(:stream, on_delete: :nothing)

      timestamps()
    end

    create index(:stream_view_permission, [:toia_id])
    create index(:stream_view_permission, [:stream_id])
  end
end
