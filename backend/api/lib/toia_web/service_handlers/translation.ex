defmodule ServiceHandlers.Translation do
  def enqueue_job(answer, results, language, video_id) do
    if answer != "" and answer != "." and length(results) > 0 do
      #   try do
      #     results = match_transcription(results, answer)
      #   rescue
      #     err ->
      #       IO.puts("Problem with matching transcription with text")
      #       IO.inspect(err)
      #   end

      IO.puts("Sending transcript for translation")
      {:ok, ch} = AMQP.Application.get_channel(:translationChannel)
      q = "translate_transcript"

      AMQP.Queue.declare(ch, q, durable: true)

      languages_supported = ["es-ES", "ar-AE", "fr-FR", "en-US"]

      languages_supported =
        Enum.filter(languages_supported, fn language_code -> language_code != language end)

      payload = %{
        "translate_to" => languages_supported,
        "results" => results,
        "video_name" => video_id,
        "input_language" => language
      }

      AMQP.Basic.publish(ch, "", q, Jason.encode!(payload))
    else
      IO.puts("No answer or no results")
      IO.inspect(answer)
      IO.inspect(results)
      :ok
    end
  end
end
