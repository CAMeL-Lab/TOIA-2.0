defmodule Toia.StreamViewPermissions do
  @moduledoc """
  The StreamViewPermissions context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.StreamViewPermissions.StreamViewPermission

  @doc """
  Returns the list of stream_view_permission.

  ## Examples

      iex> list_stream_view_permission()
      [%StreamViewPermission{}, ...]

  """
  def list_stream_view_permission do
    Repo.all(StreamViewPermission)
  end

  @doc """
  Gets a single stream_view_permission.

  Raises `Ecto.NoResultsError` if the Stream view permission does not exist.

  ## Examples

      iex> get_stream_view_permission!(123)
      %StreamViewPermission{}

      iex> get_stream_view_permission!(456)
      ** (Ecto.NoResultsError)

  """
  def get_stream_view_permission!(id), do: Repo.get!(StreamViewPermission, id)

  @doc """
  Creates a stream_view_permission.

  ## Examples

      iex> create_stream_view_permission(%{field: value})
      {:ok, %StreamViewPermission{}}

      iex> create_stream_view_permission(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_stream_view_permission(attrs \\ %{}) do
    %StreamViewPermission{}
    |> StreamViewPermission.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a stream_view_permission.

  ## Examples

      iex> update_stream_view_permission(stream_view_permission, %{field: new_value})
      {:ok, %StreamViewPermission{}}

      iex> update_stream_view_permission(stream_view_permission, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_stream_view_permission(%StreamViewPermission{} = stream_view_permission, attrs) do
    stream_view_permission
    |> StreamViewPermission.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a stream_view_permission.

  ## Examples

      iex> delete_stream_view_permission(stream_view_permission)
      {:ok, %StreamViewPermission{}}

      iex> delete_stream_view_permission(stream_view_permission)
      {:error, %Ecto.Changeset{}}

  """
  def delete_stream_view_permission(%StreamViewPermission{} = stream_view_permission) do
    Repo.delete(stream_view_permission)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking stream_view_permission changes.

  ## Examples

      iex> change_stream_view_permission(stream_view_permission)
      %Ecto.Changeset{data: %StreamViewPermission{}}

  """
  def change_stream_view_permission(
        %StreamViewPermission{} = stream_view_permission,
        attrs \\ %{}
      ) do
    StreamViewPermission.changeset(stream_view_permission, attrs)
  end
end
