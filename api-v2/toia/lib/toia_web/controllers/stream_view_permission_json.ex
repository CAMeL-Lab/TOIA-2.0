defmodule ToiaWeb.StreamViewPermissionJSON do
  alias Toia.StreamViewPermissions.StreamViewPermission

  @doc """
  Renders a list of stream_view_permission.
  """
  def index(%{stream_view_permission: stream_view_permission}) do
    %{data: for(stream_view_permission <- stream_view_permission, do: data(stream_view_permission))}
  end

  @doc """
  Renders a single stream_view_permission.
  """
  def show(%{stream_view_permission: stream_view_permission}) do
    %{data: data(stream_view_permission)}
  end

  defp data(%StreamViewPermission{} = stream_view_permission) do
    %{
      id: stream_view_permission.id
    }
  end
end
