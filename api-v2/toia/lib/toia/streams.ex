defmodule Toia.Streams do
  @moduledoc """
  The Streams context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.Streams.Stream

  @doc """
  Returns the list of stream.

  ## Examples

      iex> list_stream()
      [%Stream{}, ...]

  """
  def list_stream do
    Repo.all(Stream)
  end

  def list_public_stream do
    Repo.all(from s in Stream, where: s.private == false)
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
  def create_stream(attrs, user, filePath) do
    if attrs["name"] == "" or attrs["name"] == nil or attrs["name"] == "All" do
      {:error, "Stream name cannot be empty or All"}
    else
      {:ok, %Stream{} = stream} = %Stream{} |> Stream.changeset(attrs) |> Repo.insert()

      destDir = "Accounts/#{user.first_name}_#{user.id}/StreamPic/"
      destFilename = "#{attrs["name"]}_#{stream.id_stream}.jpg"

      case File.mkdir_p(destDir) do
        :ok ->
          case File.rename(filePath, destDir <> destFilename) do
            :ok -> {:ok, stream}
            {:error, reason} -> {:error, reason}
          end
        {:error, reason} -> {:error, reason}
      end
    end
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
end
