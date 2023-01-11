from tkinter import *
import paho.mqtt.client as paho
# broker="localhost"
broker="172.31.36.53"
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
    

def publish_mqtt(topic, msg):
    result = client.publish(topic, msg)

def sel(event):
    topic = entry1.get()
    publish_mqtt(topic, str(var.get()))

def sel3(event):
    topic = entry3.get()
    publish_mqtt(str(var3.get()))

def sel_status(event):
    publish_mqtt(str(status.get()))

def sel_status0(event):
    topic = entry0.get()
    publish_mqtt(topic, str(status.get()))

def sel_status2(event):
    topic = entry2.get()
    publish_mqtt(topic, str(status2.get()))

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
label0.config(text = 'Bomba de entrada estado')

status = IntVar() # Como StrinVar pero en entero
Radiobutton(root, text="ON", variable=status, value=1, command=sel_status0).grid(row=2, column=0)
Radiobutton(root, text="OFF", variable=status, value=2, command=sel_status0).grid(row=2, column=0, pady = 5)

label_entry0 = Label(root)
label_entry0.grid(row=3, column=0, sticky="W")
label_entry0.config(text = 'tópico:')
entry0 = Entry(root)
entry0.grid(row=4, column=0, padx = 5, pady = 5)
###########

# 2 column #
label1 = Label(root)
label1.grid(row=1, column=1)
label1.config(text = 'Válvula de entrada apertura')

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
# label2 = Label(root)
# label2.grid(row=1, column=2)
# label2.config(text = 'Contador')

# button = Button(root, text="Init MQTT", command=publish_mqtt('1'))
# button.grid(row=2, column=2)

# label_entry1 = Label(root)
# label_entry1.grid(row=3, column=2, sticky="W")
# label_entry1.config(text = 'tópico:')
# entry2 = Entry(root)
# entry2.grid(row=4, column=2, padx = 5, pady = 5)
###########

# 3 column #
label2 = Label(root)
label2.grid(row=1, column=2)
label2.config(text = 'Bomba de salida estado')

status2 = IntVar() # Como StrinVar pero en entero
Radiobutton(root, text="ON", variable=status2, value=1, command=sel_status2).grid(row=2, column=2)
Radiobutton(root, text="OFF", variable=status2, value=2, command=sel_status2).grid(row=2, column=2, pady = 5)

label_entry2 = Label(root)
label_entry2.grid(row=3, column=2, sticky="W")
label_entry2.config(text = 'tópico:')
entry2 = Entry(root)
entry2.grid(row=4, column=2, padx = 5, pady = 5)
###########

# 4 column #
label3 = Label(root)
label3.grid(row=1, column=3)
label3.config(text = 'Válvula de salida apertura')

var3 = DoubleVar()
scale3 = Scale(
            root,
            from_=0,
            to=100,
            orient='vertical',
            variable=var3,
            command=sel3
        )
scale3.grid(row=2, column=3)

label_entry3 = Label(root)
label_entry3.grid(row=3, column=1, sticky="W")
label_entry3.config(text = 'tópico:')
entry3 = Entry(root)
entry3.grid(row=4, column=1, padx = 5, pady = 5)
###########

root.mainloop()