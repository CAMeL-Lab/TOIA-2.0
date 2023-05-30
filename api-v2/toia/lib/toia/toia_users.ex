defmodule Toia.ToiaUsers do
  @moduledoc """
  The ToiaUsers context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.ToiaUsers.ToiaUser

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

  @doc """
  Creates a toia_user.

  ## Examples

      iex> create_toia_user(%{field: value})
      {:ok, %ToiaUser{}}

      iex> create_toia_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_toia_user(attrs \\ %{}) do
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
