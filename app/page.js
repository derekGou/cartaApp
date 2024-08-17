"use client"
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <>
      <div className="box-border p-12 gap-20 min-h-screen w-screen fixed flex flex-col md:flex-row items-center justify-center">
        <div className="cursor-pointer group h-80 w-80 lg:h-96 lg:w-96">
          <div className="group h-80 w-80 lg:h-96 lg:w-96 group-hover:[transform:rotateY(180deg)] transition-[transform] duration-1000">
            <img className="h-80 w-80 lg:h-96 lg:w-96 absolute grayscale -z-10 group-hover:z-10 transition-[z-index] delay-300" src="flashcards.svg"></img>
            <img className="h-80 w-80 lg:h-96 lg:w-96 absolute" src="flashcards.svg"></img>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1>carta</h1>
            <h2>The easiest way to learn anything</h2>
          </div>
          <hr/>
          <p>Studying with carta is as easy as 1, 2, 3:</p>
          <ol className="list-decimal list-inside">
            <li>Input a prompt, or continue an existing session</li>
            <li>Enter your best answer to each question</li>
            <li></li>
          </ol>
          <div className="flex flex-row gap-8">
            <SignedOut>
              <a href="/sign-up">
                <button>
                  Get started
                </button>
              </a>
            </SignedOut>
            <SignedIn>
              <a href="/generate">
                <button>Let's go!</button>
              </a>
            </SignedIn>
          </div>
        </div>
      </div>
    </>
  )
}
