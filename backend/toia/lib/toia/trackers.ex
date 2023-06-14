defmodule Toia.Trackers do
  @moduledoc """
  The Trackers context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.Trackers.Tracker

  @doc """
  Returns the list of tracker.

  ## Examples

      iex> list_tracker()
      [%Tracker{}, ...]

  """
  def list_tracker do
    Repo.all(Tracker)
  end

  @doc """
  Gets a single tracker.

  Raises `Ecto.NoResultsError` if the Tracker does not exist.

  ## Examples

      iex> get_tracker!(123)
      %Tracker{}

      iex> get_tracker!(456)
      ** (Ecto.NoResultsError)

  """
  def get_tracker!(id), do: Repo.get!(Tracker, id)

  @doc """
  Creates a tracker.

  ## Examples

      iex> create_tracker(%{field: value})
      {:ok, %Tracker{}}

      iex> create_tracker(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_tracker(attrs \\ %{}) do
    %Tracker{}
    |> Tracker.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a tracker.

  ## Examples

      iex> update_tracker(tracker, %{field: new_value})
      {:ok, %Tracker{}}

      iex> update_tracker(tracker, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_tracker(%Tracker{} = tracker, attrs) do
    tracker
    |> Tracker.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a tracker.

  ## Examples

      iex> delete_tracker(tracker)
      {:ok, %Tracker{}}

      iex> delete_tracker(tracker)
      {:error, %Ecto.Changeset{}}

  """
  def delete_tracker(%Tracker{} = tracker) do
    Repo.delete(tracker)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking tracker changes.

  ## Examples

      iex> change_tracker(tracker)
      %Ecto.Changeset{data: %Tracker{}}

  """
  def change_tracker(%Tracker{} = tracker, attrs \\ %{}) do
    Tracker.changeset(tracker, attrs)
  end
end
