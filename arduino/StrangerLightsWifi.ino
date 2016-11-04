/************************
 * Stranger Lights IoT Board code. Strangerlights.com
 * 
 * A halloween IoT project. Aphabet light board that displays messages from a server.
 * 
 * Created and compiled for the ESP8266
 * Tested on ESP-12E module, compiled with NodeMCU 1.0
 * 
 * Copyright 2016 Lucas Watson
 * 
 * Released under GPL-3.0
************************/

#include <Arduino.h>
#include <math.h>
//WIFI stuff
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>

ESP8266WiFiMulti WiFiMulti;

//Neopixel
#include <Adafruit_NeoPixel.h>
//arguments: NUMPIXELS, PIN
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(26, 10, NEO_GRB + NEO_KHZ800);

char lightStringSeq[40];
int  seqLength;
int  xmasColors[] = 
{255,10,10, //red
1,255,255,  //purple
10,10,255,  //blue
255,220,1,  //yellow
255,1,230}; 
        

void setup() {    
    Serial.begin(115200);
    pixels.begin();
    // Serial.setDebugOutput(true);

    for(int t = 4; t > 0; t--) {
        Serial.printf("Starting %d...\n", t);
        Serial.println();
        delay(500);
    }

    WiFiMulti.addAP("SSID"); //opt second argument, password

    Serial.println("Waiting for WiFi");
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }

    //Some WIFI networks require authorization (i.e. captive portal)
    //Uncomment this line for any one time requests to be made in startup
    //requestHttp("URL HERE",true);
    delay(3000);
}

void loop() {
    // wait for WiFi connection
    if(WiFiMulti.run() == WL_CONNECTED) {
      
      char* it = requestHttp("http://upsidedown.strangerlights.com/iot/getmessage?password=this-should-be-changed",false);

      if(it[0] != 43) {
        setXmasBrightness(0); //start at zero
        //main letter spelling loop
        for(int i; i < seqLength; i++) {
          //Serial.println(it[i]+1); //debug
          //if we don't have a blank space
          if(it[i] != 0) {
            
            //if the char is a space
            if(it[i] == 32) {
              delay(500); //pause
            }else{
              int colC = random(0,5); //var to choose color index
              Serial.println(colC);
              pixels.setPixelColor( (it[i]-97), pixels.Color(xmasColors[colC*3],xmasColors[(colC*3)+1],xmasColors[(colC*3)+2]) );
              pixels.show();
              delay(1000);
              pixels.setPixelColor((it[i]-97), pixels.Color(0,0,0));
              pixels.show();
              delay(200);
            }
            
          }
        }
      }else{
        int chooser = random(0,3);
        if(chooser == 0) {
          portalPulse(); 
        }else if(chooser == 1) {
          christmasLights1();
        }else{
          christmasLights2();
        }
      }
    }
    
    delay(5000);
}

//sets the lights to christmas-ey colors. Flickers for spookiness
void christmasLights1() {
  setXmasBrightness(0.6); //on
  delay(3000);
  
  for(int f=0; f < random(3,7); f++) {  //flicker
    setXmasBrightness(0.2);
    delay(random(50,200));
    setXmasBrightness(0.6);
    delay(random(1500,3500));
  }

}

void christmasLights2() {
  setXmasBrightness(0.6); //on
  delay(3000);
  setXmasBrightness(0);
  delay(2000);

  for(int b=60; b < 100; b++) { //power surge
    setXmasBrightness((float)b/100);
    delay(5);
  }

  setXmasBrightness(0.3); //one last flicker
  delay(100);
  setXmasBrightness(1.0);
  delay(2500);
  
  for(int d=50; d > 0; d--) { //dying
    setXmasBrightness((float)d/100);
    delay(1);
  }
  delay(1500);

  setXmasBrightness(0.6);
}

//intended as child of christmasLights()
//sets colors but with arg for brightness (0 to 1), ex 0.7
void setXmasBrightness(float bright) {
  int c = 0;
  
  for(int i=0; i < 26; i++) {
    if (c < 4) {
      c++; //Personally, I prefer C++14
    }else{
      c = 0; 
    }
    pixels.setPixelColor(i, pixels.Color( round(bright*xmasColors[(c*3)]) , round(bright*xmasColors[((c*3)+1)]), round(bright*xmasColors[((c*3)+2)]) ));
  }
  pixels.show();
}

//pulses every third pixel
void portalPulse() {
  for(int re=0; re < 3; re++) {
    for (int q=0; q < 3; q++) {
    
      for (int b=0; b < 254; b=b+7) {//brightness
        for (int i=0; i < 26; i=i+3) {
          pixels.setPixelColor(i+q, pixels.Color(0.7*b,0,b));
          pixels.show();
          delay(1);
        }
      }
  
      for (int b=255; b >= 0; b=b-7) {//brightness
        for (int i=0; i < 26; i=i+3) {
          pixels.setPixelColor(i+q, pixels.Color(0.7*b,0,b));
          pixels.show();
          delay(1);
        }
      }
      
    }
  }
  setXmasBrightness(0.6);
}

char* requestHttp(String url,boolean httpsBool) {
  HTTPClient http;

  Serial.println("HTTP start");
  if(httpsBool) {
    //HTTPS, the string of hex stuff is a SHA1 fingerprint for a specific site. 
    //TODO: This should be refactored, and this hex string put as a function argument. 
    http.begin(url, "51 59 9D 2E 47 B8 64 6D AA 3C F2 DA EB E4 2C C1 50 61 D5 86");
  }else{
    http.begin(url); //HTTP
  }

  Serial.println("HTTP request");
  // start connection and send HTTP header
  int httpStatus = http.GET();
  
  if(httpStatus > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("HTTP request status: %d\n", httpCode);
      
      if(httpCode == HTTP_CODE_OK) {
          String payload = http.getString();
          seqLength = payload.length();
          payload.toCharArray(lightStringSeq,40);
          Serial.println(lightStringSeq);
          return lightStringSeq;
      }
  } else {
      Serial.printf("HTTP error: %s\n", http.errorToString(httpCode).c_str());
      return false;
  }

  http.end();
}
