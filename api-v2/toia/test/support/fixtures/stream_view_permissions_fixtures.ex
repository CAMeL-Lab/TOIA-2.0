defmodule Toia.StreamViewPermissionsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.StreamViewPermissions` context.
  """

  @doc """
  Generate a stream_view_permission.
  """
  def stream_view_permission_fixture(attrs \\ %{}) do
    {:ok, stream_view_permission} =
      attrs
      |> Enum.into(%{

      })
      |> Toia.StreamViewPermissions.create_stream_view_permission()

    stream_view_permission
  end
end
