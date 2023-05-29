defmodule Toia.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.Accounts.Toia_User

  @doc """
  Returns the list of toia_users.

  ## Examples

      iex> list_toia_users()
      [%Toia_User{}, ...]

  """
  def list_toia_users do
    Repo.all(Toia_User)
  end

  @doc """
  Gets a single toia__user.

  Raises `Ecto.NoResultsError` if the Toia  user does not exist.

  ## Examples

      iex> get_toia__user!(123)
      %Toia_User{}

      iex> get_toia__user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_toia__user!(id), do: Repo.get!(Toia_User, id)

  @doc """
  Creates a toia__user.

  ## Examples

      iex> create_toia__user(%{field: value})
      {:ok, %Toia_User{}}

      iex> create_toia__user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_toia__user(attrs \\ %{}) do
    newAttrs = hash_password(attrs)

    %Toia_User{}
    |> Toia_User.changeset(newAttrs)
    |> Repo.insert()
  end

  @doc """
  Updates a toia__user.

  ## Examples

      iex> update_toia__user(toia__user, %{field: new_value})
      {:ok, %Toia_User{}}

      iex> update_toia__user(toia__user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_toia__user(%Toia_User{} = toia__user, attrs) do
    newAttrs = hash_password(attrs)

    toia__user
    |> hash_password()
    |> Toia_User.changeset(newAttrs)
    |> Repo.update()
  end

  @doc """
  Deletes a toia__user.

  ## Examples

      iex> delete_toia__user(toia__user)
      {:ok, %Toia_User{}}

      iex> delete_toia__user(toia__user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_toia__user(%Toia_User{} = toia__user) do
    Repo.delete(toia__user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking toia__user changes.

  ## Examples

      iex> change_toia__user(toia__user)
      %Ecto.Changeset{data: %Toia_User{}}

  """
  def change_toia__user(%Toia_User{} = toia__user, attrs \\ %{}) do
    Toia_User.changeset(toia__user, attrs)
  end

  @doc """
    Hash a password using bcrypt with a salt round of 12
  """
  defp hash_password(%{"password" => password} = toia__user) do
    hashedPassword = Bcrypt.hash_pwd_salt(password)
    %{toia__user | "password" => hashedPassword}
  end

  defp hash_password(toia__user), do: toia__user

  alias Toia.Accounts.Stream

  @doc """
  Returns the list of stream.

  ## Examples

      iex> list_stream()
      [%Stream{}, ...]

  """
  def list_stream do
    Repo.all(Stream)
  end

  @doc """
  Gets a single stream.

  Raises `Ecto.NoResultsError` if the Stream does not exist.

  ## Examples

      iex> get_stream!(123)
      %Stream{}

      iex> get_stream!(456)
      ** (Ecto.NoResultsError)

  """
  def get_stream!(id), do: Repo.get!(Stream, id)

  @doc """
  Creates a stream.

  ## Examples

      iex> create_stream(%{field: value})
      {:ok, %Stream{}}

      iex> create_stream(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_stream(attrs \\ %{}) do
    %Stream{}
    |> Stream.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a stream.

  ## Examples

      iex> update_stream(stream, %{field: new_value})
      {:ok, %Stream{}}

      iex> update_stream(stream, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_stream(%Stream{} = stream, attrs) do
    stream
    |> Stream.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a stream.

  ## Examples

      iex> delete_stream(stream)
      {:ok, %Stream{}}

      iex> delete_stream(stream)
      {:error, %Ecto.Changeset{}}

  """
  def delete_stream(%Stream{} = stream) do
    Repo.delete(stream)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking stream changes.

  ## Examples

      iex> change_stream(stream)
      %Ecto.Changeset{data: %Stream{}}

  """
  def change_stream(%Stream{} = stream, attrs \\ %{}) do
    Stream.changeset(stream, attrs)
  end

  alias Toia.Accounts.StreamViewPermission

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
  def change_stream_view_permission(%StreamViewPermission{} = stream_view_permission, attrs \\ %{}) do
    StreamViewPermission.changeset(stream_view_permission, attrs)
  end
end
