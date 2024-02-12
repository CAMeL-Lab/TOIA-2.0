import pika, sys, os, json, msg2srt
from dotenv import load_dotenv
from generate_srt import generate_srt
import time

try:
    from types import SimpleNamespace as Namespace
except ImportError:
    from argparse import Namespace

"""
Run rabbitmq to listen for messages from the recorder API
"""
def main():
    load_dotenv()
    while True:
        try:
            username = os.getenv('USER')
            pwd = os.getenv('PASSWORD')
            credentials = pika.PlainCredentials(username, pwd)
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq3', credentials=credentials))
            print("Connected to rabbitmq")
            channel = connection.channel()

            channel.queue_declare(queue='translate_transcript', durable= True)

            def callback(ch, method, properties, body):
                print(" [x] Received %r" % body.decode())
                try:
                    data = json.loads(body, object_hook = lambda d : Namespace(**d))
                    if(len(data.results[0]) > 0):
                        generate_srt(data.results,data.translate_to, data.video_name, input_language=data.input_language, output_file=data.input_language)
                except Exception as e:
                    print(f"Error in translation API: {e}")

            channel.basic_consume(queue='translate_transcript', on_message_callback=callback, auto_ack=True)

            print(' [*] Waiting for messages. To exit press CTRL+C')
            channel.start_consuming()

        except pika.exceptions.ConnectionClosedByBroker:
            # Uncomment this to make the example not attempt recovery
            # from server-initiated connection closure, including
            # when the node is stopped cleanly
            #
            # break
            continue
        # Do not recover on channel errors
        except pika.exceptions.AMQPChannelError as err:
            print("Caught a channel error: {}, stopping...".format(err))
            break
        # Recover on all other connection errors
        except pika.exceptions.AMQPConnectionError:
            print("Connection was closed, retrying in 5 seconds...")
            time.sleep(5)
            continue

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)