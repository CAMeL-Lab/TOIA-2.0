defmodule Toia.WaffleTokenFetcher do
    @behaviour Waffle.Storage.Google.Token.Fetcher
  
    @impl true
    def get_token(scope) when is_binary(scope) do
      Goth.fetch!(Toia.Goth).token
    end
  end