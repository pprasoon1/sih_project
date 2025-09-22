import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Import the new stylesheet

const Home = () => {
  return (
    <div className="home-page">
      {/* --- Hero Section with Animated Showcase --- */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">See an issue? Report it in seconds.</h1>
            <p className="hero-subtitle">
              CivicVoice uses AI to make reporting local issues effortless. Just upload a photo or use your voice, and our assistant handles the rest.
            </p>
            <div className="hero-actions">
              <Link to="/agent" className="btn btn-primary">
                <span>🚀</span> Try the AI Assistant
              </Link>
              <Link to="/feed" className="btn btn-secondary">
                View Community Feed
              </Link>
            </div>
          </div>

          <div className="hero-animation">
            <div className="phone-mockup">
              <div className="phone-screen">
                {/* Animation Step 1: Image Upload */}
                <div className="animation-step step-1">
                  <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA2wMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAEBQIDAAEGBwj/xAA+EAACAQMCAwYDBgUDBAIDAAABAgMABBESIQUxQRMiUWFxgTKRoQYUQrHB0RUjUuHwB3LxJDNTooKyJUNi/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//EABkRAQEBAAMAAAAAAAAAAAAAAAARARIhQf/aAAwDAQACEQMRAD8A73tT02xUhORgc96VrcXIG9q+DjfIA/vWLeMATJbyLjmyjP5V2YNBL1xv44rNcbMp0jVgjJ88H9KVi9QqvdnG2QTGdqgtxGWLCWRQvQ5x+VA2e4CDCRhsHxFaE/eKlScnJ5UCtwjYCSK5I1AK29TZgSCH1EDkNxUoLaYb9wYHMc6h2oPxIgPhvQyg6cOwfbqMfOoiNYVHYoVJOcZoDe1XT8KgdSMCtJMA2PhUY3zkUEjtjB1Dn+LFZqJB3yTz3oD9QO5JXPguard2U4TSR+Ilj9KGIByW7ucZyRyrfTYk4GRg0ReCQRk4GM6cg1gO3dI3GTjpQo+HDSP6aj/mK02pVQlxkHfPWgKkKkAkdcHbP/NbGE2Gx8KVff2dXS1SSRs/h/eqVsZJ4tHEpXnw2WB2UctseG1Ayku4Y1dFdXbPwBix9NqrFxca9CR9iucgsc5Hp+9XaVC5D4BHTAFRSRhlVdlbG2V2FBI2qghpQzvzAZsknHKrhGFQd1QQBgBcYoYBI0UO4CjHLp86wzZAZGdhnkBjHvQWyprGCQQm+GFRjuIWU6ZRz236+FVlzzU7dds4qlYkBLhEMp/FtmrgLLhm0K2WAyQP3qeRnUyOd8aSaX3cvYhUQ6ASeQA9hVkcr7MsT6FOzNp329aAxWxkDOevlUM793vP/VgZ6ChC920hKiFVA2J5n9KHvZLqOIkSM7BDhVqjXF+IPZ28jDZ1UlGYgEnoP7Utih4pNEkst7co7AEqqgAURwG3iuA19MzSXjgKxl/ARkYGdwKd9uw2IT5UEkkQNkTIygfDkCpCRRgl1ZT0DjlVH3e21Ykg7p6GqntbWCVvu9nGpY94gYyKijw6k6tSsM7MNiajIwZgSACeeps0M1pbPuYgByOonNUtwuCTdBLH4NFKyg+wNKCWiiIIaFCOuF2/KtPbW+nU1vErEbNoAP5VQnC4mXSZJznJZWnYgjz69a0vCbaJk0o6Bc4Ak1AexNQXKoGdE7g7Zxgj8qhI8oGI7hTjmGHP3FVNBw3dbjsC/wDQwU48Kr7Hhz7LahgQckQ4wKCQ4pFGp7aM7Z3Xf5jmKiOLp8AtZnx1C7exIHjUxCY3JW3uea6Gypz0G7NmtPJxCRWjWKIoerN09vTnRFkF5r1iO0nODiQBlODz8awXTaXxZuGU5C5XJHzqFuj2yutraWiBySyjK5Jzz8c1qSXiQjCC2iREXJEbAjboNxQDzX102MwpHqOkAy4OTsOSnepW1lczRluJs8kTcoxgg+pwCaoittVw9w1/N27d1UkVQEHgNW/v1q6Z+IKoxxWAAA92RRqwB5b0DXsUiiCaCFUYXC7Dy/4rbZ1hUidg2TqUrhfLcg/IUmsIOJWUDIbmNo3Jk1MSOfngfQValzfmU/zrBfAb5/PzoGw7MH+e76eQ07/Wh3uA2Vt1L77Nq50nuL27E4AeCbHOONXYe+Kta+v4kwvDlZQMnSxQZ6YBHkaBi8MkpImdtPijFf1qSKsfdQNk8txSuLiNxPIAPusLfiEhOc7e9XJck3K2wvrMzspYRhO8PMb8qA+SWNE1SOqY3y7UIHmnfBnWOM4wF2LVXcWEtx2i3U0TK2NLaCCD86ttrCWAB1uNTjmeyxtjzzQWpbxKwIQliTuWLH5mrc4AYAauR2ziqTGyEmS6bfOBhf8ABVMk6Iu1wp3zqZfOqCi4Ay+NvKkP2hdJbO4jkuFTWMBypPtgYP5UPxPj0QgdrW4inIxpES5yScePKt8Kt4rqUTXV2lzPzDkY7LwAXbB8zvQE/Z95ltoY2tFiVEAK40j5AnBx406Lb9a2ItK6F6nYqdz51vsh1aTPWqFy8VczPHoldz1ZsKPLGaKjvr1mwYYFGchu23PrmtTW1hcRqTMvZvJjGSdZwdh1+XhQl1w+GInsZXUnK4jGMj5c/Ws1qCbu6ukxmVFYHS2kEjV54Gf08elURXd/LOTEQQOb6jpA9zufagIInDrDLcP2ikK2s6dR8htn1GfamxsLqVe9fP2ajLAL3fp5VCNiOaQRrcXpj3yRGQjH18qGZbYzGCQ3L5OSwmd+R5YOQKufhR1ITKZG32Kklh4ZyK2/DTHMrF4khHNpQc48FOr9DQjcN1YwEIkfZqBu5yM+mOdWNxjh6YCEFiTjC6h7kbDrtSu7js+8EYuBzwuV55586V3EytO0CoTKRlixOAp8SfE7bb0I6G443bwoZFOBjOpmC59z0oZ/tLBKAsMTvncssb6W64zj/M7UgtuDQyzNNdM8hOO48pKqByCht+g8PSjg7CVlYCPOMNq2x4Y6n0oQzl4rJMgW3s5tbLhCAAM+ef1HzqgXfEI9TG0LIAManXA+X+dao++RRSn7vDhSuAXbLk9dz0981ubiELRdm5KqFHeL4APoaJA9/fXk0qK8Cy6lyIuzJVfElhywOXWtxW1zgMqB2Ox0KVBHrjPzNJZ7+1S9drCTtLp8akaTEbnlknfGPAU6TiN+miNZ11j4V05wfXAIG3WlIKa24vOoCdomD8LDKk+mn9qjJwjijIAOwZk3y/58sVCSe/m0n71GQD0f58ts/Opy3F4oIllmXY4ZckYwOu/jRF1lZ8aWOQRi0XB04UHfffmTRTQ8ZLES3CRxtsxVdQA+f1OaBilFsVZ7p1IbVpBO/rjnmojj88a6mnbQBsdG+3nnf/igYS8HWQI0l40jZHeLDc49PSg7m2gtmYSXz61XSzaMH5kUuuOPzszpBNh12KczzyBzx4+FCz3jXAZeITOke3djYgtnfc539qLF5v5dP/Q8SnnmY/BGmABvnPwgfPNGxXfG5BGJDGpcHVp1E7eQ57frVcD2qLF2MKaDsobAA+vhTGDi0MJZI40xjVhcHB/wVSB4eDX/ABGRTJeiJVO6gFdYxyG+femEP2Z4fDql7JHbnr0Zz7k5rcfFYlXXMhRl7wZScbeXWpjjFvdKdTMVYZOA23h5/wDNUaHDLcsqFWijwcMMcsdMj96rH2a4bKxkd5WkO2sSFD/64ouOS3LIUnhAO51knbqBmr1ZCWMTxDfAUHb5ZqhXccKNsga3ubkZz3ASykbc85ob79cJ3QowNvgpzLfQxYje6QNkjbr5bCgZrm0MrEW6yDPxhDvUQsi48s7CSK3hZgO6SRqB88HPhW4uJThdMUVtEjZOwwSx6Yx+1cb95tpJBHYpNISMtIE7T0yPami3EkYI7F5WBzqVQufQBt6y2bTrxS7cmOKAebo2DtzHL9aIFvxePGbhQ2O6oDNg/Pl6mlI4nMG7IyzkMT3QOfkPHBxuKsk4jxF42BRwcYCMx2z0YjrtyzUDiWbi0AP/AFUCHn3XVSR1O7Unu+LTujKsyXcinUYUbOPzHvypc83F9L4ltsqSyyZY559Dj+9IeI2nGbaB7gzxsGYs3YjSd+ZxQdTAlxODNdbSAZWEvggY6gZHOpSzLax63ht1RfiPbAY6557V5tLxbiAGk3kygDGznehpbue4CrPKZCDtrNKO2m+2NunaaYZJH5BmIVSKR8R+1F7fDSs62yYxpRsE+9IRAWO5yPDoKtjttY7is58FQnFBZLxC9lZTJPO55jLGqJrq4l2mmlc7DDMdvnRJt1VNcndycYbu++OdbjtBOFS3IkfTqIxU0CQzNGXHf3GAARRsfHL+P4bmQY5KWqmSBrZ1WWIjUDv1O+Mioz4bQFXYfGSOZqKZW32p4uoIa7zhc5Zfh+X5UYv2yvywjxE5BGW0nLePXakKRwvIA8phTScsN8noMVRCjspONxjI/Kl1I6pvthKRpFmGGP8AykY9sVuD7S/eQizYi8FyoVfMk9a5Z1lGSRgnzqPZyJz3Y9Ooq0jvLPisTMv/AF3DwqHDZkxnPh4n6b0THJtqtUiJUYCHvqfPPMfMjyrz1GiiOJo2bIOMbEVNLggOkRYDGM53ApR6Jb3RmZ4IIxFcBsOBgtjHmSNPXIFXo15FE0kUaXUx7zsrhd/HcHHyrz2yupYb2J4SRKudL6snka9EtZ0mtYi9wHOMsw2BJ8/U7VRt5rhCwMLhwgOUU7fmOuM0QZVEcZknCAkEajjBx1/zrVUaukeiGQLpbKtJ1P8Au3PtQ1xHcS3CHXE+NwI32xzwy55bdTuT50QfDcszBWaPvbl1bUG8OWN/apx3OSsjK4DN3ToG/qR5UtBuUdngndGAC61i1BR6Zxty8tqFfiM8GWluWlyNI7NSWY+fRTz2NWjoXu4+9hlAU4JxufYeZrSiVBpi16OmXFJpuJO0UUCSxuH+JiwLLt/TjdiegxWzCCe6XYctWMZ+lKROKyiZlUpEwUZ1nvHby3ot44wQBMJCBnGDnNUwWzy5SWeRwp0kjHdPQefr9KIg4bdTBi41x5xpDjJHMdBUUJeKzm1B1dkZF14GT5EeAq2Qh3ZIolkWPG+Nj02z+9Ez8IuHdRIrRAoe72mM55nl9M1UOC29m0ZjFoBp0DTnAxsM70ENY1DW2MHUMooG3MZ6Uo4zxS2S1kSORJJjyw4YZ+W/hmi+L/Zi44jDgXPZRpkP2ewYb4yC3IehNczdfY3jlrokMUE0SbKY2znw9qBLOryO823Zsc5AwB5UMqd85jyvntXTxcUnt+ytOO2aaOSv2aqcH02x5U0sOGcGnl+8xxQTRo4YxpK2lsc1I6A+VZ2jjYUlkmWO3jJY8o4+8x6bYGTXacA/03+0PGrbtbn/AKC3HwLeqysxB37nMddyK9L+z/2l4PbgR/w+LhzOoRmtxkYAAGdgcYA8a7G1mhuo+0tZEmTlqjYHenavKbH/AEYjMQN9xzRLnlb24ZQPUkb+1FL/AKL8KI/ncdu33/DBGNvfNepaQu7Qs3qK1r6pbqB/tqDkLX/T37O2nCjYW9pGxcd+4lDNK/T4gVx7YAriOIf6PcQSU/cb21eEliA5KFB0HM59a9nDr/4m9FUY+tbUv/8ArTT/ALiBQfOt3/p/xHhxQcTntoGfOlY27TI8c4AqrhX2eYS/eYrW+uooSBK9vbGRQ2/IDcnlsM43zmvom6tIrzT98it5CpyutdWPTNBxyNb31wk1jFa26IhS81qFl57YzkY25/1UHz7/AACGO1iltSkrqM3SuTmBuRBGrbwGRvvz3olPs7MJI47e3lwwDlxESQvLJ/v18K9c+1H2oSyhjkjjtpYjKFlS55leYZByPewN+VLn49w3jhHDOI8KjuZtwmqVlV16MGwTk4x+tVHkNzw50mCSRlXJZUDrjVg4OSTvjYYFDDhSrD2hChfjBG4cZwQMb869csPsRw7iEUTxzcY4e6lv5P3lJwFODht2x5HY1TxP/TviElzJPDxGxnRwoa3uLVowcEHOpWJzkeFB5NLZi1cSFlWQIf5TDnj8j5U64Tx6O2e2sTbyyam+ISAFg3LbHP3rqvtF9iLq04eJezt8KNU0i3OdGGyAAUGoHkfag+FcCs0eKVoGMuMlyuSD12q4L5ZJbZh2iPpYgJj4uW3PFRmuYiqCUFO7gafpk9D1oiSzgWPtDMkaqdJwQDk/l9a0kKMSV0BlzklSMdN+W3OqFUF2XmZYZXl57SMMDrnIP5/sK3NHcSBGKQjALfGWAPvz/tTprJ2z2bsPILzGc5GR50JccMiYoHGiX/yOFYcjsdvCgXdvKwYtcAnY5xqB32BxuRjp086Ng4hbxxKjPbOR+IPgH2q4RJDJrDESEA7ITjpnz8dhQn8SAJFvbvJGCQG7TGSDvtp8c1RfNFdJLC0CxHVhHiZjg5O2nA29BnPtTLh0PEH+JVEmwZQxYJt/ap8VuI5JzH2WEPNlbl5nY+PSjuH3sccIja9gkRBg9szaiMeON6IDfhnFZHUS/dVGdsayx5+mDQk/C7zttaupCnSMLjT5Z1Niugbi1uM6HRzggd7Zue2cVfqgdQyrCNZydQXJP7+dEc+63VrCO0iMmgDSwY5x4gn96oTiRgB7azmjRsjJTWPUlc/Wunw5cBVxgZGds8/DrVZsYjKsjQxty7rjVg+OKLXM3UlnMjCa2DrJjKyYK+GcHfJ9KVTcJtAFaLhjI+od62XRIh8c5H6c66+SK1WcQyRYYklW7PfO+y55jflQ7cGhZioW4hC4OqLDDPhjUAOdErz/AItBxh5FWy/iOlj3tbquD/uVs/PNejf6Z8Is/s3BcXvF+OWct7dqFkWNidOMndvxHfnjApbcRwJle0WMx5Op5DhiN+8QCQeY6ilPDzOJbgXAV1kOteyIOw8CV3A9tyfWpuLXqV/9tOE2U6Rl57gMRmSBcqueu5yR6ZqyP7Z8EkkK/eZlZTghoZB+nLfnXmckL6NUbOobcB1G2fSqrZGj3nlIz3cJGFQn6knepxK9i4Tx204w868PlllED6HbQ2jOM7E4B9qnxzjNlwSz+9cRbCZCr3d2J5AV5Za3d9axKlhfXqANqwkzKuf9oODy96eXHE+IcUsRYXz28qyA9+WIK7ADyJwacVqi+/1EvrqZ47KOG3i56nXJ0+OTtn2pFN9ruMSfzP4lK8TABlGhlJ6jBwPoajffZywdmeSPUzDGrtWy3129KVR8Mg4bet95kLJIdKLK/ciGORwN8nGM/wDNiUXefam04pHPDx2eRJnjXEkag5I3xpYZBOAAVHjRlhdB+LNdWvApUM8JQzaNRwW3ysnInYn3o3hsXDLSIMtskegZ1Kg3H+eNP4hHPbCMRIxO+2Bk+oPrSFK7qXjgC9m138OUTUYu9/8AE/p+VAx3P24XiUVweJQCFdzA5LdrtuCNseo3BrrUKIpyUyynLMgx79fCqVnt5420GKfDbjmBvk9NvIY2qxKW8b43eXmpUthEijOkXBGsHG5wMH0PPekrXN9r7MxGMY3Ea/Ec+I/I4rory4jJAk1tpPdIHw+AwaWXN3btIZI2kZnOQqLq1bch/nSrFoRL6d1IWRNMa6W07FDj8XXryqibiVtbOF1xqU/oQEg8uXPxFWLYvdktfwT28WcLE41lvDLAkjfHL/grsYi2lLhI1TpFjAGeXj9KRKW/xVe0aN2khjcf96RuzQn18fnVtxC/4pkhd1UFlLkY8sYyMY6UfLw7CExhJIyMnuAhh6fvStYZOFJ2cMaSWQcySw576nOe7jY7dKC1OGy3AaJrpijbEQQhPXvFjz8qPi4W8caoloQoGBkLTDht5ayQq1jIioT3lY55c+XkfGi4542QHtHPmDp+hFAsS+sgzyRxgtjSNK428M0NbzW7XJaW1UhyQkZGvB2HhTT+F2Wlu6V3BJ7TOR47n0oU8Et2buMQ5PxMNRIzyz+1ASsNrc5DwRITyC7k+w6+tCScCB79q/ZHVtyUYHTYeu9aj4dLAFaO7CuudDaSxb3H9qz/APMWxyOyuVBOQTg/PxoK5l4xC4CTlocYKIQBnxJxmopxm8QaLm3BRTuwIxkdT4H2NTbjMbj+ZbuHGTnXsD59PDr+tVJxKISDPZsoGSDgFv2/tQSHF4+1JMv3ZicoXjDewHr1xV7S2spLyzqpY5XMmR8h+XiaHjbhkk3azytgA6lUbAc+ZFWk8McrpeMkgjeMqfqMj1oB+JtYPAFieJ1YDPdyC2OXL8vKlPDL+JmdJHBCyMuUVSXIOx5ZA+VdAsHD7hcNNFGRgBZNgo2GAQOfrS66sVDxiIlCc6HUA5+W2P8APCoJTXrs6smlSW5iMk+JOR6UNcFG1pPbSvp31SIcHzG4/wA9qGluri0kxcW8fZcmeKTHuR4e9dDYNFOpbTGcbFXbOf8APWgRJFKpKW8jnv5GYiMDpudz9OfOmGbvMccTRaVUHGkavPYYwPnTGS2hkuQ8KLGqqMk8iffn+tG20ckIcMRkbnsQSSvntQIWuLuEa5IzsM4Vzz9SPz2qp7mLYTBgzgk9rHt88YPzroprZLuISaMN07Rxv7A4pX/DYxC8k7xJqBCaY9QI6522+VAlljNrKLnhn8uHTiSJG7rDxC8tt+lE2fF1wNNwXDHYaTk+u25oXifBbC6jaOSJR/TIo0+xwRketa4XMlvmwuMaocKr5yrnHL6j0yKBiL64mlIftJiv4SoRAPXO/Tx9KLsDfSPqHciGCVRNj4jP9qKsTb7rKkeSchiuxFM+yUKpVAcgdAwIHlVCX+DBpdd05vFyWELRqyoOeNGwPhk5NNghaAIVjEYUBVUaQMdAPCsYKq6gCGY8sHIqRVR8YBPXJOfzq4MVpckpp0kjSo5j3zQ9zGr6VFtEznmGfBX02OaLVRpK6c+oHj0qmUJMQjJKgAAI7yqfegoFratGUa2dAdjq239jQF/aW9vG4jiZtuanG/02p393VUBAIwNKsMHaknHbuC3hZfvGEHxEk8/XrTRz/DXe0ubhmWXWJRIikM2BgYOPDOaefxi4O6cNkkH9eoDP/tSv7M2f8QkuLppJFMkp0OwGCo5HHz5710/8MzzuZyfHtAP0pgLJZ8AHK4yBtn6VaSGUAE4GMDH51AOVQDKhR+HIznyreolcANqA+EgZNIrWFXJ19/OTp5msdw0WY03IyCW3HrihWDINRheJ03yG1A+1BWt6ZZyszJpU4JCt3jjOdunOog2zjtj3JDHr6qUAAyd9+tWy2FlMWhMRCDDOoyB5dai9la3SBplJ1d4NupH+edYsRg+GUsCu3aZ5Z6HkKCo8O4c0RDwRxaegBAPudzVM3BrZ3HZxqiPgHnv0HM0fIDINDxroPxKRnetJEzFWRnwQe6z6VHt+tAv/AIHbdsiIwUpkHv43x5+tQu+DExyNbSv23NQ0uRnoMbEfOmKRSIQ0YWXVkkAYI9TWCaQyadJcOe+QMBRj18dqDkb7gV9Kr/8Ac07mRY5Qcr165qNo97w+KMTwTOi75Ru8RnbIx/m9djIzGQL2YCqucGUZJ6898b1ZJGsuNS90LgFsDHlQI4uK2sjaW/lyqdyRyx5E5NNbe8illcKZDg5HdGWqq4sYZlwIgjEYAB5/n/nWkMnCru2fto7uQQknKPjuA+ex+tB1OFdtaYDA5BbOCPfn9aTcTu7yMy6UMLcj3zpPsp60BYcdvLWdVmspZouXdbOPkcitcS47ZSoGaZISMk5kOQfA6uXyFEBpJLeqrwGRYDnv6VBc/wD8g5wPbNUxK8XGbVmd3lETDU6hSwyORxv6eVQ4HeSXNnItppeGKRlEja9x54H7nanUVnd3DQyLPEuhtaurDVn13qKOt7WVtJVnjYZ7xi1H9z8qsHDLtWDDiDlCN10Af/bl8qqiu721uWW8jaVAw/nBC3zA5+o+lNormC6jbsplfxHPH7VqI1bxtHGFkkLYHPA5H0FXMIZGYB0Ziu2k4/LlVCsVB7mFx4YHn13qQUq2tVbLfiUDagFvru3tjiS8kt25FFwxP0qyx4gl0jCCaSRQcksOf0xWpLa1uJDJLGjZ/qTfy8zVqRww9zSkSp4HunNBe7MykA51cgwH7YrlOPWKSa4yG0MM6t9j06Driun0o4GzYXcZG1JuO30UVuwaSNSgJZlYMPzoFf2W4jMF7IFZVOVEuPPnprpXlVWIaM58jXPfZGyJEt3eRmJpHL4IOAOQ2PzrpSIyc4X5VcFDcTtjlZGkjblyyPpU4b6K4AIljZcZcvhcbbHHrUykUkAMyoxY50kZx61SvDLKbUzQIcHmV5e2ajSUzQSAjt8ahgiNxufLpSF5UgudagAFt2kbYc8Zx7eW9O24bYKWKRF35kKoOPbNUScJUMTCcNnOl1x7VAXacREmn+YiORnA5HbxqccUkk4efBfTsVdtGD1xyz865p7e5tZpC8AUcyZBg+xzg0fb8aMUQS4iYqdhpU5I88bUD58hgUwVKnIL8/y+tU5DBUd3DjcxoV28By8POgk4raOQcOFOxDvsPQf5tRcV1bmRAh7zjCdPrvRFxGqM6iScfDpx05VS6uEwmldvxA7eWKk8wVWZY3kIGQAP1qAuUEymQaMqT3unr0FBLRIsKGRO8diFJwPT/iphY2QF2JJ7uoNufpUHkieESq+MHVvuNvyoUXaGdyj9wD4MjHI75JwKAn7sEQ6GmOD8Wo1p0kRgvxKQD3gefliq2u7gMOyAOCM5YYO3jU1udcmEGtj+FWww/eg28RlTEqsSRvpbGOnPnQVxwW3vCWUrEc95GXIPtRXbKwy4aMrzDL+taEy6FQSRnvbjUCf7URwt1Z3vAuIS/cJbhoJH1dmEODnbauj4JxOKW2ETMndOytlSh8MY2NG8TjW4t+bEkHOmQas+hrh+IQ3VvbvNHLL8YKsxHd35np4fKmq9HUtowOQ3DZ2PXlVQijR30xvGdRb4samPOlHCb9n7KGcHJXUuG5nqc+FPVB0Ak5XOw5c+dWiAOMBXIA55bHTp4j6VYGIAUDUQORoY6jIQA0ivyP8AT5flVsSxxxgayoG4BOfXc86ImuCOzbPPCguMtVFwkMSCSaLUw3DFQdP/ABS3iX2hit1LCQRLyy+4byFKjPe8Rl0ROVQtnVJzJPgOnv8AKim93xmCJDBFINQycoQdvLfnXNxgX9797uraRIh8MbLgls/F/an/AAzgEFndtcyl5Lg7Fic52FOWETaQ0OMHIOjb6mgXW3ELSKLsf5mkHcybfLxov79bf1P8hUrmwtpoj2kKKoOchcUCeAQMcorhTyGDVD0/99R44OasCDckk4GcVlZWWgzNm5iAAGpNRI9am/eYRju5/Epwaysoiu6bRqIxkHn13oWS2jliZpAScAjyrKyg5wwKJpijMpyc4POsF3NFcyRqwIXGkkbjbyrKygJF7OlwFD7Z6imYuD2OWjRtWCdQz1rVZUG7OUzQkkKg32QYFWTpGsajs0bvYyygnlWVlDVN1YQh8jUMEHAbbeg7mAJbo6ySgrIVHfztgGsrKHij7xM8Ukgk0snLSox18qgvELlJY1Egw3MaRvjlWVlVFDcZuxOVBjA1Hkgqq5vJHcs6o2BkAjx9KysoilMG0SVFEbC57L+XsCGVmyR45Ub0RZ3tzICnbOoRsDSem9ZWVMa0TdXtxDmNZWIG+WOT86USSTTsgM7qGySBg9fMGsrKph5wjh1vKJHkDNIqgBy2+9FX2rhtykNsxCZUnUASc+fvWVlEMpZG0ofHAIzRHZqcg5IABAJrKyqIuO4H66j+dW9ipHWsrKo//9k=" alt="Pothole" className="pothole-image" />
                </div>
                {/* Animation Step 2: AI Analysis */}
                <div className="animation-step step-2">
                  <div className="loader-icon">🤖</div>
                  <p>AI analyzing image...</p>
                  <div className="loader-bar"></div>
                </div>
                {/* Animation Step 3: Issue Detected */}
                <div className="animation-step step-3">
                  <div className="check-icon">✓</div>
                  <h3>Pothole Reported</h3>
                  <div className="detected-details">
                    <p><span>Category:</span> Pothole</p>
                    <p><span>Location:</span> Near Pari Chowk</p>
                  </div>
                </div>
                {/* Animation Step 4: Submitted */}
                <div className="animation-step step-4">
                  <h3>Report Submitted!</h3>
                  <p>+8 Points Awarded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* --- Features Section --- */}
        <section className="content-section">
          <div className="feature-row">
            <div className="feature-text">
              <h2 className="feature-title">The Power of a Photo</h2>
              <p className="feature-description">
                Don't waste time filling out complicated forms. Just upload a photo of the issue. Our AI instantly analyzes the image to identify the problem, suggest a category, and even write a preliminary description for you.
              </p>
            </div>
            <div className="feature-visual">
              <img src="https://media.istockphoto.com/id/1421460958/photo/hand-of-young-woman-searching-location-in-map-online-on-smartphone.jpg?s=612x612&w=0&k=20&c=Kw8yHXSKmEhfjJVscY51Zob6IRjof0N2wmj2zp2-iRI=" alt="Phone showing a map" />
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-text">
              <h2 className="feature-title">Your Voice is Heard</h2>
              <p className="feature-description">
                On the go? Simply record a voice message describing the problem. Our intelligent assistant transcribes your words, extracts key details, and structures them into a clear and concise report.
              </p>
            </div>
             <div className="feature-visual">
              <img src="https://us.images.westend61.de/0001563042pw/smiling-male-professional-talking-through-speaker-on-smart-phone-in-office-GUSF05888.jpg" alt="Person speaking into a phone" />
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-text">
              <h2 className="feature-title">Real-time Impact</h2>
              <p className="feature-description">
                Once submitted, your report is live. You and your neighbors can track its status in real-time, upvote for urgency, and see a transparent timeline of when it gets resolved. Every report contributes to a better community.
              </p>
            </div>
             <div className="feature-visual">
              <img src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop" alt="Community analytics dashboard" />
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="cta-section">
            <div className="cta-content">
                <h2>Ready to Make a Difference?</h2>
                <p>Join thousands of citizens who are actively improving their communities. Get started for free today.</p>
                <div className="cta-actions">
                    <Link to="/signup" className="btn btn-primary">Create Your Account</Link>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default Home;