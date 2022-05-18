package com.example.chatapp

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Base64
import android.util.JsonReader
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.features.logging.*
import io.ktor.client.features.websocket.*
import io.ktor.http.*
import io.ktor.http.cio.websocket.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import java.net.ConnectException
import java.time.Instant
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.Executor
import java.util.concurrent.Executors


class Chat : AppCompatActivity() {
    lateinit var session: DefaultClientWebSocketSession
    lateinit var adapter: MessageAdapter
    lateinit var messagelist: ArrayList<Message>
    lateinit var view: RecyclerView
    private var scope = CoroutineScope(Dispatchers.IO)



    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_room)
        val login = intent.getStringExtra("senderId")
        val code = intent.getStringExtra("code")



        messagelist = ArrayList()
        adapter = MessageAdapter(context = applicationContext,messagelist, login )
        findViewById<RecyclerView>(R.id.RecyclerView).adapter = adapter
        findViewById<RecyclerView>(R.id.RecyclerView).layoutManager = LinearLayoutManager(this)
        //addTestMessage(login)
        setupButton(login)
        runWebSiocketClient(code,login)
        view = findViewById<RecyclerView>(R.id.RecyclerView)

    }

    fun setupButton(login: String?){
        val button = findViewById<ImageView>(R.id.buttonSend)
        button.setOnClickListener {
            val messageView = findViewById<EditText>(R.id.messageBox)
            val m = Message(messageView.text.toString(), login, LocalDateTime.now())

            messageView.text.clear()
            Log.d("SOCKET", Gson().toJson(m))
            runBlocking {session.send(Gson().toJson(m))}
            adapter.addNewMessage(m)
            view.scrollToPosition(adapter.itemCount - 1)


        }
    }

    fun runWebSiocketClient(code: String?, login:String?){
        val client = HttpClient(CIO){
            install(WebSockets)
            install(Logging){
                logger = Logger.DEFAULT
                level = LogLevel.ALL
            }
        }
        scope.launch {
            val basek4Encoded = Base64.encodeToString(code!!.toByteArray(),Base64.DEFAULT)
            Log.d("BASE64",basek4Encoded.toString())
            try{
                client.webSocket(method = HttpMethod.Get , host = "chatapp.westeurope.cloudapp.azure.com", port = 8000, path = "/ws/${basek4Encoded.trim()}?username=${login?.trim()}"){
                    session = this
                    session.send("""{"message":"xdxd","is_encrypted":"false"}""")
                    while (true){
                        val receiveMessage = incoming.receive() as? Frame.Text
                        val message = receiveMessage?.readText()
                        Log.d("debug", message!!)
                        val messageContent = JSONObject(message)
                        val decode = Base64.decode(messageContent.getString("message"), Base64.DEFAULT)
                        val m = Message(decode.decodeToString(),messageContent.getString("author"),LocalDateTime.parse(messageContent.getString("timestamp")))
                        runOnUiThread {
                            if(m.senderId != login) {
                                adapter.addNewMessage(m)
                                view.scrollToPosition(adapter.itemCount - 1)

                            }
                        }

                    }
                }
            }
            catch(e:ConnectException){
                runOnUiThread {Toast.makeText(this@Chat, "Connection refused", Toast.LENGTH_SHORT).show()}
                finish()
            }
        }


    }
//    fun addTestMessage(login: String?){
//        val m1 = Message("To moja pierwsza wiadomosc",login, LocalDateTime.now())
//        val m2 = Message("To wiadomosc od wysylacego", "sad", LocalDateTime.now())
//        adapter.addNewMessage(m1)
//        adapter.addNewMessage(m2)
//    }
//
}