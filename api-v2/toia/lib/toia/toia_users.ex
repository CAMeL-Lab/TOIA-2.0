defmodule Toia.ToiaUsers do
  @moduledoc """
  The ToiaUsers context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.ToiaUsers.ToiaUser
  alias Toia.Streams.Stream

  @doc """
  Returns the list of toia_user.

  ## Examples

      iex> list_toia_user()
      [%ToiaUser{}, ...]

  """
  def list_toia_user do
    Repo.all(ToiaUser)
  end

  @doc """
  Gets a single toia_user.

  Raises `Ecto.NoResultsError` if the Toia user does not exist.

  ## Examples

      iex> get_toia_user!(123)
      %ToiaUser{}

      iex> get_toia_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_toia_user!(id), do: Repo.get!(ToiaUser, id)
  def get_toia_user_by_email!(email), do: Repo.get_by!(ToiaUser, email: email)

  @doc """
  Creates a toia_user.

  ## Examples

      iex> create_toia_user(%{field: value})
      {:ok, %ToiaUser{}}

      iex> create_toia_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  # `Accounts/${fields.firstName[0]}_${entry.insertId}/StreamPic/All_${stream_entry.insertId}.jpg`;
  def create_toia_user_with_stream(
        %{"profile_pic" => %Plug.Upload{path: path}} = toia_user_params
      ) do
    toia_user_params = Map.delete(toia_user_params, "profile_pic")
    {:ok, toia_user, stream} = create_toia_user_with_stream(toia_user_params)
    destDir = "Accounts/#{toia_user.first_name}_#{toia_user.id}/StreamPic/"
    destFilename = "All_#{stream.id_stream}.jpg"

    case File.mkdir_p(destDir) do
      :ok ->
        case File.rename(path, destDir <> destFilename) do
          :ok -> {:ok, toia_user, stream}
          {:error, reason} -> {:error_pic, reason}
        end

      {:error, reason} ->
        {:error_pic, reason}
    end
  end

  def create_toia_user_with_stream(attrs) do
    {:ok, %ToiaUser{} = toia_user} = create_toia_user(attrs)
    stream = %{name: "All", toia_id: toia_user.id}
    {:ok, %Stream{} = stream} = Toia.Streams.create_stream(stream)

    {:ok, toia_user, stream}
  end

  def create_toia_user(attrs \\ %{}) do
    %{"password" => password} = attrs
    hash = Bcrypt.hash_pwd_salt(password)
    attrs = %{attrs | "password" => hash}

    %ToiaUser{}
    |> ToiaUser.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a toia_user.

  ## Examples

      iex> update_toia_user(toia_user, %{field: new_value})
      {:ok, %ToiaUser{}}

      iex> update_toia_user(toia_user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_toia_user(%ToiaUser{} = toia_user, attrs) do
    toia_user
    |> ToiaUser.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a toia_user.

  ## Examples

      iex> delete_toia_user(toia_user)
      {:ok, %ToiaUser{}}

      iex> delete_toia_user(toia_user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_toia_user(%ToiaUser{} = toia_user) do
    Repo.delete(toia_user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking toia_user changes.

  ## Examples

      iex> change_toia_user(toia_user)
      %Ecto.Changeset{data: %ToiaUser{}}

  """
  def change_toia_user(%ToiaUser{} = toia_user, attrs \\ %{}) do
    ToiaUser.changeset(toia_user, attrs)
  end
end
