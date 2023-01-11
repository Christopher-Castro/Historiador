from tkinter import *
import paho.mqtt.client as paho
broker="localhost"
port=1883

def connect_mqtt():
    global client
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)
    def on_publish(client,userdata,result):             #create function for callback
        print("data published \n")
        pass
    # Set Connecting Client ID
    print('Mqtt Init')
    client = paho.Client("MQTT_Client")
    client.on_connect = on_connect
    client.on_publish = on_publish  
    client.connect(broker, port)
    

def publish_mqtt(msg):
    result = client.publish('topico', msg)

def sel(event):
   publish_mqtt(str(var.get()))

def sel_status(event):
   publish_mqtt(str(status.get()))

connect_mqtt()

root = Tk()
root.title('Cliente MQTT')

# Título #
label = Label(root)
label.config(text = f'Conectado al Broker MQTT: {broker}   -   puerto: {str(port)}')
label.grid(row=0, column=0, columnspan=2)
###########

# 1 column #
label0 = Label(root)
label0.grid(row=1, column=0)
label0.config(text = 'Velocidad Agitador')

status = IntVar() # Como StrinVar pero en entero
Radiobutton(root, text="ON", variable=status, value=1, command=sel_status).grid(row=2, column=0)
Radiobutton(root, text="OFF", variable=status, value=2, command=sel_status).grid(row=2, column=0, pady = 5)

label_entry0 = Label(root)
label_entry0.grid(row=3, column=0, sticky="W")
label_entry0.config(text = 'tópico:')
entry0 = Entry(root)
entry0.grid(row=4, column=0, padx = 5, pady = 5)
###########

# 2 column #
label1 = Label(root)
label1.grid(row=1, column=1)
label1.config(text = 'Estado')

var = DoubleVar()
scale = Scale(
            root,
            from_=0,
            to=100,
            orient='vertical',
            variable=var,
            command=sel
        )
scale.grid(row=2, column=1)

label_entry1 = Label(root)
label_entry1.grid(row=3, column=1, sticky="W")
label_entry1.config(text = 'tópico:')
entry1 = Entry(root)
entry1.grid(row=4, column=1, padx = 5, pady = 5)
###########

# 3 column #
label2 = Label(root)
label2.grid(row=1, column=2)
label2.config(text = 'Contador')

button = Button(root, text="Init MQTT", command=publish_mqtt('1'))
button.grid(row=2, column=2)

label_entry1 = Label(root)
label_entry1.grid(row=3, column=2, sticky="W")
label_entry1.config(text = 'tópico:')
entry2 = Entry(root)
entry2.grid(row=4, column=2, padx = 5, pady = 5)
###########


root.mainloop()