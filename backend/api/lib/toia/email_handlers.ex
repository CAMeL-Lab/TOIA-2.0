defmodule EmailHandlers do
  def handle_event([:swoosh, :deliver, :stop], _measurements, metadata, _config) do
    if Map.get(metadata, :error) do
      IO.puts("====== Error sending email =======")
      IO.inspect(metadata)
    else
      IO.puts("Email sent successfully")
    end
  end

  def handle_event([:swoosh, :deliver, :exception], _measurements, metadata, _config) do
    IO.puts("====== Error sending email =======")
    IO.inspect(metadata)
  end

  def handle_event([:swoosh, :deliver_many, :stop], _measurements, metadata, _config) do
    if Map.get(metadata, :error) do
      IO.puts("====== Error sending email =======")
      IO.inspect(metadata)
    else
      IO.puts("Email sent successfully")
    end
  end

  def handle_event([:swoosh, :deliver_many, :exception], _measurements, metadata, _config) do
    IO.puts("====== Error sending email =======")
    IO.inspect(metadata)
  end
end
