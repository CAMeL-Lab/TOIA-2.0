defmodule Toia.StreamViewPermissions.StreamViewPermission do
  use Ecto.Schema
  import Ecto.Changeset

  schema "stream_view_permission" do

    field :toia_id, :id
    field :stream_id, :id
  end

  @doc false
  def changeset(stream_view_permission, attrs) do
    stream_view_permission
    |> cast(attrs, [])
    |> validate_required([])
  end
end
