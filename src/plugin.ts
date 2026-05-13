import streamDeck from "@elgato/streamdeck";
import { RateMeter } from "./actions/rate-meter.js";

streamDeck.actions.registerAction(new RateMeter());
streamDeck.connect();
